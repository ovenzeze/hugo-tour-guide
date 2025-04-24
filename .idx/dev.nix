{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.pnpm
  ];

  env = {};
  idx = {
    extensions = [
      "vscode-icons-team.vscode-icons"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["pnpm" "dev"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    workspace = {
      onCreate = {
        pnpm-install = "pnpm install";
      };
      onStart = {};
    };
  };
}
