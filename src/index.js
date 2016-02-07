import program from "commander";

program
	.version("1.0.0")
	.command("parse <file>", "Parse UAV events spreadsheets")
	.parse(process.argv);
