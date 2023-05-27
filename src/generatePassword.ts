import fs from "fs";
import { shuffle } from "lodash";
import { resolve } from "path";
import { environment } from "@raycast/api";
import { Readable } from 'stream';

// Load the word list from file
const filePath = resolve(environment.assetsPath, "The_Oxford_3000.txt");
const words = fs.readFileSync(filePath, "utf8").split("\n");

// Define the leet speak rules
const leetRules: Record<string, string[]> = {
  a: ["a", "A", "4", "@"],
  b: ["b", "B", "8"],
  c: ["c", "C", "("],
  d: ["d", "D"],
  e: ["e", "E", "3", "&"],
  f: ["f", "F"],
  g: ["g", "G", "9"],
  h: ["h", "H"],
  i: ["i", "I", "1", "!"],
  j: ["j", "J"],
  k: ["k", "K"],
  l: ["l", "L", "1"],
  m: ["m", "M"],
  n: ["n", "N"],
  o: ["o", "O", "0"],
  p: ["p", "P"],
  q: ["q", "Q", "9"],
  r: ["r", "R"],
  s: ["s", "S", "5", "$"],
  t: ["t", "T", "7", "+"],
  u: ["u", "U"],
  v: ["v", "V"],
  w: ["w", "W"],
  x: ["x", "X"],
  y: ["y", "Y"],
  z: ["z", "Z", "2"],
};

export interface PasswordData {
  password: string;
  plaintext: string;
  strength: number;
}

// Password strength evaluation function
const evaluatePasswordStrength = (password: string): number => {
  const strengthRules = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/];
  return strengthRules.reduce((strength, rule) => (rule.test(password) ? strength + 1 : strength), 0);
};

// Generate a single password
const generateSinglePassword = (wordCount: number, maxIterations = 1000): PasswordData | null => {
  const wordLength = words.length;
  let password = "";
  let plaintext = "";
  let iterationCount = 0;

  while (iterationCount < maxIterations) {
    const indices = Array.from({ length: wordCount }, () => Math.floor(Math.random() * wordLength));
    plaintext = indices.map(index => words[index]).join(" ");

    password = plaintext
      .split('')
      .map(char => shuffle(leetRules[char.toLowerCase()] || [char])[0])
      .join("");

    const strength = evaluatePasswordStrength(password);
    if (strength >= 4) {
      return { password: password.replace(/ /g, "-"), plaintext, strength };
    }

    password = "";
    iterationCount++;
  }

  return null; // Unable to generate a password
};

// Password generator function
async function* passwordGenerator(wordCount: number, passwordCount: number, maxIterations = 1000) {
  let generatedCount = 0;

  while (generatedCount < passwordCount) {
    const batchCount = Math.min(passwordCount - generatedCount, 100); // Adjust the batch size as needed
    const passwords: PasswordData[] = [];

    for (let i = 0; i < batchCount; i++) {
      const password = generateSinglePassword(wordCount, maxIterations);
      if (password) {
        passwords.push(password);
      }
    }

    for (const password of passwords) {
      yield password;
      generatedCount++;
    }
  }
}

export default function generatePassword(wordCount: number, passwordCount: number, maxIterations = 1000): Readable {
  return Readable.from(passwordGenerator(wordCount, passwordCount, maxIterations));
}
