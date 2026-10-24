
      stream.on("end", () => {
        const _idx = streams.findIndex((s) => s === stream);
        streams[_idx].done = true;
        setInstallStream({ ...installStream, streams });
        if ("shortcut" in mod && (electron.remote || false)) {
          const res = electron.shell.writeShortcutLink(
            path.join(
              os.homedir(),
              "Desktop",
              mod.shortcut.replace("exe", "lnk")
            ),
            {
              target: path.join(configurations.dow_directory, mod.shortcut),
              cwd: configurations.dow_directory,
            }
          );
          if (!res) toast(`Unable to create shortcut for ${mod.shortcut}`);
        }
      });