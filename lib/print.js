import chalk from 'chalk';

const styles = {
    info: chalk.cyan,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
};

export function printLog(type, message) {
    const style = styles[type] || chalk.white;
    const tag = `[${type.toUpperCase()}]`;
    console.log(style(tag), message);
}