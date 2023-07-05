import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export function collectArgs() {
  const { argv } = yargs(hideBin(process.argv));

  return argv;
}
