const fs = require('fs');
const path = require('path');

const electionsFile = path.join(__dirname, '..', 'data', 'elections.json');
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

function getElections() {
  const rawText = fs.readFileSync(electionsFile, 'utf-8');
  return JSON.parse(rawText);
}

function saveElections(elections) {
  const jsonText = JSON.stringify(elections, null, 2);  fs.writeFileSync(electionsFile, jsonText, 'utf-8');
}

function getUsers() {
  const rawText = fs.readFileSync(usersFile, 'utf-8');
  return JSON.parse(rawText);
}

function saveUsers(users) {
  const jsonText = JSON.stringify(users, null, 2);
  fs.writeFileSync(usersFile, jsonText, 'utf-8');
}

module.exports = { getElections, saveElections, getUsers, saveUsers };
