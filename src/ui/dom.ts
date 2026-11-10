export const createElement = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
};

export const createButton = (
  text: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement => {
  const button = createElement('button', className, text);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
};

export const createLabeledControl = (labelText: string, control: HTMLElement): HTMLLabelElement => {
  const label = createElement('label', 'field');
  const caption = createElement('span', 'field__label', labelText);
  label.append(caption, control);
  return label;
};
