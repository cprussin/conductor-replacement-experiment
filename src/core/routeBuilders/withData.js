// @flow

/**
 * Return a new object created by mapping the function over the values in the
 * given object.
 */
const mapValues = (object, fn) =>
    Object.entries(object).reduce(
        (acc, entry) => Object.assign(acc, { [entry[0]]: fn(entry[1]) }),
        {}
    );

/**
 * Take an array, an index, a field name, and a transformation function, and
 * return a new array with the value of the field of the item at the given index
 * replaced by the result of applying transformation function to the original
 * value.
 */
const updateFieldAtIndex = (arr, index, field, transform) =>
    arr
        .slice(0, index)
        .concat({
            ...arr[index],
            [field]: transform(arr[index][field])
        })
        .concat(arr.slice(index + 1));

/**
 * Return the index of the model in the given model set.
 */
const findModelIndex = (modelSet, model) =>
    modelSet.findIndex(item => item.data === model.data);

/**
 * Add the given parent to the model's dependent list at the specified index in
 * the model set.
 */
const addDependent = (modelSet, index, parent) =>
    updateFieldAtIndex(modelSet, index, 'dependents', dependents =>
        dependents.concat(parent)
    );

/**
 * Create a new model set from the given one, with the model and all of it's
 * dependencies inserted.
 *
 * Note that because this is a DFS algorithm, we don't know what the index will
 * be for dependencies until after they're inserted.  So first, create a new
 * model set containing the model (but with no dependency indices in the
 * `dependencies` object), and all the dependencies.  Once this new model set
 * has been created, we can go back and update the model to include all the
 * dependency indices in it's `dependencies` object.
 */
const insertModel = (modelSet, model, parent) => {
    const newIndex = modelSet.length;
    const newSet = Object.values(model.dependencies).reduce(
        (acc, cur) => insertOrUpdateModel(acc, cur, newIndex),
        modelSet.concat({
            data: model.data,
            dependencies: [],
            dependents: parent === undefined ? [] : [parent]
        })
    );
    return updateFieldAtIndex(newSet, newIndex, 'dependencies', dependencies =>
        mapValues(model.dependencies, dependency =>
            findModelIndex(newSet, dependency)
        )
    );
};

/**
 * Given a model set and a model, and possibly a parent ID, does one of the
 * following:
 *
 * - If the model is already in the model set, return a new set that is
 *   identical to the old one, except that the parent ID has been added to the
 *   model's list of dependents
 * - If the model is not already in the model set, return a new set that
 *   contains the model and all of the models dependencies, recursively calling
 *   back into this function for each dependency
 *
 * This function implements an immutable DFS algorithm to flatten the dependency
 * tree into an array containing objects with the following attributes:
 *
 * - `data`: the async function that implements the data model
 * - `dependencies`: an object mapping dependency names to the indices of the
 *   dependencies in this array
 * - `dependents`: an array of integers which point to the index of models that
 *   depend on this one
 */
const insertOrUpdateModel = (modelSet, model, parent) => {
    const index = modelSet.findIndex(item => item.data === model.data);

    return index === -1
        ? insertModel(modelSet, model, parent)
        : addDependent(modelSet, index, parent);
};

/**
 * This function takes a configuration object mapping model names to data
 * models.  It generates an array containing objects with the following
 * properties:
 *
 * - `data`: the async function that implements the data model
 * - `dependencies`: an object mapping dependency names to the indices of the
 *   dependencies in this array
 * - `dependents`: an array of integers which point to the index of models that
 *   depend on this one
 *
 * This object can be used at request time to effeciently resolve the dependency
 * tree down to the necessary model data.
 */
const prepareData = data =>
    Object.values(data).reduce((acc, cur) => insertModel(acc, cur), []);

/**
 * Resolve the model, inserting into the given data set.  After resolving the
 * model, go through dependents.  For all of the dependents that now have no
 * unresolved dependencies, recursively call this function for those dependents.
 */
const resolveModel = async (options, model, models, resolvedData) => {
    const args = mapValues(model.dependencies, index => resolvedData[index]);

    resolvedData[findModelIndex(models, model)] = await model.data(
        options,
        args
    );

    await Promise.all(
        model.dependents
            .map(dependentId => models[dependentId])
            .filter(dependent =>
                Object.values(dependent.dependencies).every(
                    dependencyIndex => resolvedData[dependencyIndex]
                )
            )
            .map(dependent =>
                resolveModel(options, dependent, models, resolvedData)
            )
    );
};

/**
 * Resolve the data set from the given prepared data object (as returned from
 * `prepareData`).
 *
 * This uses a mutable algorithm.  This is because, since we traverse into
 * dependencies that are fully resolved, we need to be able to access parallel
 * model data without waiting for all parallel promises to resolve.  There is no
 * way to do that with current promise APIs without introducing a mutable object
 * that's inserted into by the parallel promises as they work--`Promise.all`
 * awaits all promises to resolve, and `Promise.race` only allows access to the
 * data in the first promise that resolves.
 *
 * There is probably a cleaner/more idiomatic implementation here, but for the
 * purposes of this proof of concept prototype, this will do.
 */
const resolveData = async (options, models) => {
    let resolvedData = {};
    await Promise.all(
        models
            .filter(model => Object.values(model.dependencies).length === 0)
            .map(model => resolveModel(options, model, models, resolvedData))
    );
    return resolvedData;
};

const withData = ({ data, onSuccess }) => {
    const preparedData = prepareData(data);
    const dataIndices = mapValues(data, model =>
        findModelIndex(preparedData, model)
    );
    return async (options, req, res) => {
        options.logger.info({ buckets: Object.keys(data) }, `Fetching data`);
        const resolvedData = await resolveData(options, preparedData);
        const finalData = mapValues(dataIndices, index => resolvedData[index]);
        await onSuccess(finalData)(options, req, res);
    };
};

export default withData;
