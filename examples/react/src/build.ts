import { join } from "node:path";
import prerenderMacro from "prerender-macro";

const { success, logs } = await Bun.build({
  entrypoints: [join(import.meta.dir, "index.tsx")],
  outdir: join(import.meta.dir, "..", "dist"),
  plugins: [
    prerenderMacro({
      prerenderConfigPath: join(import.meta.dir, "prerender.tsx"),
    }),
  ],
});

if (success) console.log("Build complete ✅");
else console.error("Build failed ❌", logs);
