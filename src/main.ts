import { BuildMonitor } from ".";
import * as readline from "readline-sync"

const appName = readline.question("Enter application name:")
const ownerName = readline.question("Enter owner name:")
const token = readline.question("Enter token:")

const ab = new BuildMonitor(appName, ownerName, token);

ab.startBuilds()
