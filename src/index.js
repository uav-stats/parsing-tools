import program from "commander";

program
	.version("1.0.0")
	.command("parse <file>", "Parse UAV events spreadsheets into JSON file")
	.command("create-posts <file>", "Create Jekyll posts from JSON file")
	.parse(process.argv);
