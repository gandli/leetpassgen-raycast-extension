import fs from "fs";
import path from "path";
import * as _ from "lodash";

const filePath = path.join(__dirname, "./assets/The_Oxford_3000.txt");

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

interface PasswordData {
  password: string;
  plaintext: string;
}

const generatePassword = async (wordCount = 3, passwordCount = 1, maxIterations = 1000): Promise<PasswordData[]> => {
  const words = fs.readFileSync(filePath, "utf8").split("\n");
  const passwordData: PasswordData[] = [];
console.log(wordCount, passwordCount);
  for (let c = 0; c < passwordCount; c++) {
    let password = "";
    let plaintext = "";
    let iterationCount = 0;

    while (iterationCount < maxIterations) {
      plaintext = _.shuffle(words).slice(0, wordCount).join(" ");

      password = Array.from(plaintext)
        .map((letter) => _.shuffle(leetRules[letter] || [letter])[0])
        .join("");

      if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
        break;
      }

      password = "";
      iterationCount++;
    }

    passwordData.push({ password: password.replace(/ /g, "-"), plaintext });
  }

  return passwordData;
};

export default generatePassword;