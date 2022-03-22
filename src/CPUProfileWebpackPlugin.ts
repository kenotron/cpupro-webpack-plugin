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
    const logger = compiler.getInfrastructureLogger(PluginName);

    if (!this.options.outputPath) {
      this.options.outputPath = path.resolve(compiler.options.output.path, "webpack.cpuprofile");
    }

    // Start profiling as soon as this plugin is applied
    logger.info(`Starting CPU Profile: ${this.profileName}`);
    profiler.profile(this.profileName);

    // Stop profiling when the entire webpack run is done
    compiler.hooks.done.tapPromise(PluginName, async (_stats) => {
      const { outputPath } = this.options;
      const profile = profiler.profileEnd(this.profileName);
      profile.writeToFile(outputPath);
      logger.info(`CPU Profile written to: ${outputPath}`);
    });
  }
}
