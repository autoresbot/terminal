const { spawn } = require('child_process');
const cp = require('child_process');
const { promisify } = require('util');
const exec = promisify(cp.exec).bind(cp);
const readline = require('readline');
const path = require('path');

const COLORS = {
    RESET: '\x1b[0m',
    BLUE: '\x1b[34m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const options = [
    {
        name: 'Install Script resbot',
        repoUrl: 'https://github.com/autoresbot/resbot.git',
    },
    {
        name: 'Install Script jpm & pushkontak',
        repoUrl: 'https://github.com/autoresbot/script-jpm.git',
    },
];

function start(cmd) {
    try {
        return spawn(cmd, [], {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        });
    } catch (error) {
        console.error(`\n${COLORS.RED}Failed to start command ${cmd}:${COLORS.RESET}`, error);
    }
}

async function execute(cmd) {
    try {
        await exec(cmd);
    } catch (error) {
        console.error(`\n${COLORS.RED}Failed to execute command ${cmd}:${COLORS.RESET}`, error);
    }
}

async function showMenu() {
    return new Promise((resolve) => {
        console.log(`\n${COLORS.GREEN}Select an option:${COLORS.RESET}`);
        options.forEach((option, index) => {
            console.log(`${COLORS.YELLOW}${index + 1}. ${option.name}${COLORS.RESET}`);
        });
        console.log(`${COLORS.YELLOW}${options.length + 1}. More${COLORS.RESET}`);
        console.log(`${COLORS.YELLOW}Please enter your choice (1-${options.length + 1}):${COLORS.RESET}`);


        rl.question('> ', async (answer) => {
            const choice = parseInt(answer.trim(), 10);
            if (choice > 0 && choice <= options.length) {
                const selectedOption = options[choice - 1];
                console.log(`\n${COLORS.YELLOW}Cloning repository...${COLORS.RESET}`);
                const tempDir = 'temp-repo';
                await execute(`git clone --depth 1 ${selectedOption.repoUrl} ${tempDir}`);
                await execute(`cp -r ${path.join(tempDir, '*')} .`);
                await execute(`rm -rf ${tempDir}`);
                console.log(`\n${COLORS.GREEN}Repository content copied successfully!${COLORS.RESET}`);
                console.log(`\n${COLORS.GREEN}Please Restart Your Server${COLORS.RESET}`);

            } else if (choice === options.length + 1) {
                console.log(`\n${COLORS.YELLOW}More options will be available here.${COLORS.RESET}`);
            } else {
                console.log(`\n${COLORS.RED}Invalid choice. Exiting.${COLORS.RESET}`);
            }
            rl.close();
            resolve();
        });
    });
}

async function main() {
    await execute('clear');
    console.log(`\n${COLORS.BLUE}====================================${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}      Terminal ready to use!      ${COLORS.RESET}`);
    console.log(`${COLORS.BLUE}====================================${COLORS.RESET}`);
    await showMenu();
    const bashProcess = start('bash');
    if (bashProcess) {
        bashProcess.on('exit', (code) => {
            console.log(`\n${COLORS.YELLOW}Bash shell exited with code ${code}${COLORS.RESET}`);
        });
        bashProcess.on('error', (error) => {
            console.error(`\n${COLORS.RED}Failed to start bash shell:${COLORS.RESET}`, error);
        });
    } else {
        console.error(`\n${COLORS.RED}Failed to start bash shell.${COLORS.RESET}`);
    }
}

main();
