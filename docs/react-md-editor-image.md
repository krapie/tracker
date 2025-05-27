# https://github.com/uiwjs/react-md-editor/issues/83

Hi, I have tried to implement a way to upload an image by Drag&Drop directly into the editor or by Copy&Paste and display it in the preview. It may not be a very pretty method, but I hope it will be useful to you. Here's my EXAMPLE!

```
import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import onImagePasted from './utils/onImagePasted';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MdEditor = () => {
  const [markdown, setMarkdown] = useState<string | undefined>();

  return (
    <div data-color-mode="light">
      <MDEditor
        value={markdown}
        onChange={(value) => {
          setMarkdown(value);
        }}
        onPaste={async (event) => {
          await onImagePasted(event.clipboardData, setMarkdown);
        }}
        onDrop={async (event) => {
          await onImagePasted(event.dataTransfer, setMarkdown);
        }}
        height={440}
        textareaProps={{
          placeholder: 'Fill in your markdown for the coolest of the cool.',
        }}
        hideToolbar
      />
    </div>
  );
};

export default MdEditor;
```

```
import type { SetStateAction } from 'react';
import { fileUpload } from '../../../../../libs/firebase/storage';
import insertToTextArea from './insertToTextArea';

const onImagePasted = async (dataTransfer: DataTransfer, setMarkdown: (value: SetStateAction<string | undefined>) => void) => {
  const files: File[] = [];
  for (let index = 0; index < dataTransfer.items.length; index += 1) {
    const file = dataTransfer.files.item(index);

    if (file) {
      files.push(file);
    }
  }

  await Promise.all(
    files.map(async (file) => {
      const url = await fileUpload(file);
      const insertedMarkdown = insertToTextArea(`![](${url})`);
      if (!insertedMarkdown) {
        return;
      }
      setMarkdown(insertedMarkdown);
    }),
  );
};

export default onImagePasted;
```

```
const insertToTextArea = (intsertString: string) => {
  const textarea = document.querySelector('textarea');
  if (!textarea) {
    return null;
  }

  let sentence = textarea.value;
  const len = sentence.length;
  const pos = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const front = sentence.slice(0, pos);
  const back = sentence.slice(pos, len);

  sentence = front + intsertString + back;

  textarea.value = sentence;
  textarea.selectionEnd = end + intsertString.length;

  return sentence;
};

export default insertToTextArea;
```
