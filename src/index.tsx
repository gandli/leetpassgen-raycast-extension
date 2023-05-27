import { useEffect, useState } from "react";
import { LaunchProps, List, Action, ActionPanel, Icon, showToast, Toast, popToRoot, Clipboard } from "@raycast/api";
import generatePassword, { PasswordData } from "./generatePassword";

interface PasswordArguments {
  wordCount: string;
  passwordCount: string;
}

const DEFAULT_WORD_COUNT = 3;
const DEFAULT_PASSWORD_COUNT = 9;
const MAX_COUNT = 99;

export default function Command(props: LaunchProps<{ arguments: PasswordArguments }>) {
  const wordCountArg = props.arguments.wordCount;
  const passwordCountArg = props.arguments.passwordCount;
  const [passwords, setPasswords] = useState<PasswordData[]>([]);

  const parseNumber = (value: string, defaultValue: number) => {
    let parsedValue = parseInt(value);
    if (parsedValue > MAX_COUNT) {
      showToast(Toast.Style.Failure, "Count cannot be greater than 99");
      parsedValue = MAX_COUNT;
    }
    return !isNaN(parsedValue) ? parsedValue : defaultValue;
  };

  useEffect(() => {
    const validWordCount = parseNumber(wordCountArg, DEFAULT_WORD_COUNT);
    const validPasswordCount = parseNumber(passwordCountArg, DEFAULT_PASSWORD_COUNT);

    const passwordStream = generatePassword(validWordCount, validPasswordCount);
    passwordStream.on("data", (passwordData: PasswordData) => {
      setPasswords((passwords) => [...passwords, passwordData]);
    });

    return () => {
      passwordStream.destroy();
    };
  }, [wordCountArg, passwordCountArg]);

  const handleCopyPassword = async (password: string) => {
    Clipboard.copy(password, { transient: true });
    await showToast(Toast.Style.Success, "Password has been copied to the clipboard 😄");
    await popToRoot();
  };

  return (
    <List isLoading={passwords.length === 0} isShowingDetail>
      <List.Section title="Results" subtitle={`${passwords.length}`}>
        {passwords.map((p, index) => {
          const words = p.plaintext.split(" ");
          const wordCount = words.length;
          const passwordLength = p.password.length;

          return (
            <List.Item
              key={index}
              icon={Icon.Key}
              title={{ value: p.password, tooltip: p.plaintext }}
              detail={
                <List.Item.Detail
                  markdown={words.map((word) => `\`${word}\``).join("\u00A0\u00A0\u00A0")}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="Word Count" text={wordCount.toString()} />
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Password Length" text={passwordLength.toString()} />
                      <List.Item.Detail.Metadata.Separator />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <Action
                    title="Copy Password"
                    icon={Icon.CopyClipboard}
                    onAction={() => handleCopyPassword(p.password)}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
