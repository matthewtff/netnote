import * as express from "express";

import * as helmet from "helmet";

import {Config, GetConfig} from "./base/configuration";

const kServerName = "NetNote";

function Terminator(sig?: string): void {
  if (sig) {
    console.log("%s: Received %s - terminating sample app ...",
      Date.now(), sig);
  } else {
    console.log("%s: %s server stopped.", Date.now(), kServerName);
  }
  process.exit(1);
}

class App {
  private app_: express.Application;
  private config_: Config;

  constructor() {
    this.config_ = GetConfig();
    this.SetupTerminationHandlers();
    this.InitializeServer();
    this.Start();
  }

  // Start the server (starts up the sample application).
  private Start(): void {
    //  Start the app on the specific interface (and port).
    this.app_.listen(this.config_.port,
                     this.config_.ip_address,
                     this.OnStartedListening.bind(this));
  };

  // Setup termination handlers (for exit and a list of signals).
  private SetupTerminationHandlers(): void {
    //  Process on exit and signals.
    process.on("exit", Terminator);

    // Removed "SIGPIPE" from the list - bugz 852598.
    ["SIGHUP", "SIGINT", "SIGQUIT", "SIGILL", "SIGTRAP", "SIGABRT",
      "SIGBUS", "SIGFPE", "SIGUSR1", "SIGSEGV", "SIGUSR2", "SIGTERM"
    ].forEach(signalName =>
      process.on(signalName, Terminator.bind(global, signalName))
    );
  };

  // Initialize the server (express) and create routes.
  private InitializeServer(): void {
    this.app_ = express();
    this.Hardend();  // Add some security features.
    this.app_.use("/afonts/", express.static(__dirname + "/../front/afonts"));
    this.app_.use("/css/", express.static(__dirname + "/../front/css"));
    this.app_.use("/fonts/", express.static(__dirname + "/../front/fonts"));
    this.app_.use("/js/", express.static(__dirname + "/../front/js"));
    this.app_.use("/html/", express.static(__dirname + "/../front/html"));
    this.app_.use((<any>express).cookieParser());
    this.app_.use((<any>express).bodyParser());

    this.app_.get("/", (req: express.Request, res: express.Response) => {
      res.redirect("/html/netnote.html");
    });
  };

  private Hardend(): void {
    this.app_.use(helmet());
  }

  private OnStartedListening(): void {
    console.log("%s: %s server started on %s:%d ...",
                Date.now(), kServerName, this.config_.ip_address,
                this.config_.port);
  }
}

const app = new App();
