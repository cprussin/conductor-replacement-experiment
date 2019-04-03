{
  nodejs ? "10.15.1",
  yarn ? "1.12.3",
  nixjs-version ? "0.0.7",
  nixjs ? fetchTarball "https://github.com/cprussin/nixjs/archive/${nixjs-version}.tar.gz",
  nixpkgs ? <nixpkgs>,
}:

let
  nixjs-overlay = import nixjs { inherit nodejs yarn; };
  overlays = [ nixjs-overlay ];
  pkgs = import nixpkgs { inherit overlays; };
in

pkgs.mkShell {
  buildInputs = [
    pkgs.git
    pkgs.nodejs
    pkgs.yarn
    pkgs.flow
  ];
  shellHook = "export NODE_ENV=development";
}
