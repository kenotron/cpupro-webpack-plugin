import { Compiler } from "webpack";
import path from "path";
// @ts-ignore TS2307 cpupro uses the package.json exports which TS doesn't quite support yet
import profiler from "cpupro";

export interface CPUProfileWebpackPluginOptions {
  profileName?: string;
  outputPath?: string;
}

const PluginName = "CPUProfileWebpackPlugin";

export class CPUProfileWebpackPlugin {
  private profileName: string;

  constructor(private options: CPUProfileWebpackPluginOptions) {
    this.profileName = options.profileName ?? "webpack";
  }

  apply(compiler: Compiler): void {
    const logger = compiler.getInfrastructureLogger("cuppro-webpack-plugin");

    if (!this.options.outputPath) {
      this.options.outputPath = compiler.options.output.path;
    }

    compiler.hooks.beforeRun.tapPromise(PluginName, async (_compiler) => {
      profiler.profile(this.profileName);
    });

    compiler.hooks.done.tapPromise(PluginName, async (_stats) => {
      const profile = profiler.profileEnd(this.profileName);

      const cpuprofileFilePath = path.resolve(this.options.outputPath, "webpack.cpuprofile");
      profile.writeToFile(cpuprofileFilePath);

      logger.info(`CPU Profile written to: ${cpuprofileFilePath}`);
    });
  }
}
