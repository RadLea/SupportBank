import moment from "moment";
import {parse} from 'csv-parse';
import * as fs from "fs";
import * as path from "path";

class Transaction {
    narrative: string;
    person: Wallet;
    type: string;
    sum: number;
    date: any;


    constructor (narrative: string, person: Wallet, type: string, sum: number, date: any) {
        this.narrative = narrative;
        this.person = person;
        this.type = type;
        this.sum = sum;
        this.date = date;
    }
}

class Wallet {
    owner: string;
    balance: number;
    transactions: Transaction[];

    constructor (owner: string, balance: number) {
        this.owner = owner;
        this.balance = balance;
        this.transactions = [];
    }

    transfer (to: Wallet, amount: number, narrative: string, date: any) {
        if (this.balance - amount < 0) {
            console.log("Not enough money!");
        } else {
            this.balance -= amount;
            to.balance += amount;
            this.transactions.push(new Transaction(narrative, to, "To", amount, date));
            to.transactions.push(new Transaction(narrative, this, "From", amount, date));
        }
    }
}

function listAll(Users: Record<string, Wallet>) {
    Object.entries(Users).forEach(([key, values]) => {
        if (values.balance < 0) {
            console.log("Owes " + values.balance * -1);
        } else {
            console.log("Has " + values.balance);
        }
    })
}

function main() {
    const csvFile = path.resolve(__dirname, 'Transactions2014.csv');

    const headers = ['Date', 'From', 'To', 'Narrative', 'Amount'];

    const fileContent = fs.readFileSync(csvFile, {encoding: "utf-8"});

    let Users: Record<string, Wallet> = {};

    parse(fileContent, {
            delimiter: ',',
            columns: headers,
        }, (error, result) => {
            if (error) {
                console.error(error);
            }

            for (let i = 1; i < result.length; i++) {
                if (!Users.hasOwnProperty(result[i].From)) {
                    Users[result[i].From] = new Wallet(result[i].From, 0);
                }
                if (!Users.hasOwnProperty(result[i].To)) {
                    Users[result[i].To] = new Wallet(result[i].To, 0);
                }

                Users[result[i].From].transfer(Users[result[i].To], result[i].amount, result[i].narrative, moment(result[i].date, 'DD/MM/YYYY'));
                console.log(Users);
            }
        }
    );
    listAll(Users);
}

main();