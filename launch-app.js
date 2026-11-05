const { spawn } = require("child_process");

const projectDirectory = __dirname;
const server = spawn(process.execPath, ["server.js"], {
  cwd: projectDirectory,
  stdio: "inherit",
  windowsHide: false
});

setTimeout(() => {
  spawn("cmd.exe", ["/c", "start", "", "http://localhost:3000"], {
    cwd: projectDirectory,
    windowsHide: true
  });
}, 700);

server.on("exit", code => {
  process.exitCode = code ?? 0;
});
