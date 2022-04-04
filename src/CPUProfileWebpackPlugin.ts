import { Compiler } from "webpack";
import path from "path";
import { promisify } from "util";
import inspector from "inspector";

export interface CPUProfileWebpackPluginOptions {
  profileName?: string;
  outputPath?: string;
}

const PluginName = "CPUProfileWebpackPlugin";

export class CPUProfileWebpackPlugin {
  private session: inspector.Session;
  private profileName: string;

  constructor(private options: CPUProfileWebpackPluginOptions = {}) {
    this.session = new inspector.Session();
    this.session.connect();
    this.profileName = options.profileName ?? "webpack";
  }

  apply(compiler: Compiler): void {
    const fs = compiler.intermediateFileSystem;
    const writeFile = promisify(fs.writeFile);
    const logger = compiler.getInfrastructureLogger(PluginName);

    if (!this.options.outputPath) {
      this.options.outputPath = path.resolve(compiler.options.output.path, "webpack.cpuprofile");
    }

    // Start profiling as soon as this plugin is applied
    logger.info(`Starting CPU Profile: ${this.profileName}`);
    const cpuProfilerEnable = promisify(this.session.post.bind(this.session, "Profiler.enable"));
    const cpuProfilerStart = promisify(this.session.post.bind(this.session, "Profiler.start"));
    const cpuProfilerStop = promisify(this.session.post.bind(this.session, "Profiler.stop"));

    const profileStartPromise = cpuProfilerEnable().then(() => {
      return cpuProfilerStart();
    });

    // Stop profiling when the entire webpack run is done
    compiler.hooks.done.tapPromise(PluginName, async (_stats) => {
      await profileStartPromise;

      const { outputPath } = this.options;
      try {
        const profile = await cpuProfilerStop();

        if (!profile) { 
          throw new Error("output did not contain profile information");
        }
        
        await writeFile(outputPath, JSON.stringify(profile.profile));
        logger.info(`CPU Profile written to: ${outputPath}`);
      } catch (e) {
        logger.error(`CPU Profile plugine encountered an error: ${e}`);
      }
    });
  }
}
