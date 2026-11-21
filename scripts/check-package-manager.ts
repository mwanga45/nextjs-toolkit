const ua = process.env.npm_config_user_agent ?? "";
if (!ua.includes("bun")) {
  console.error("This project must be installed with Bun. Run: bun install");
  process.exit(1);
}
