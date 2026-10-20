import type {
  ChoicePersonalisation,
  TextPersonalisation,
} from "@/lib/types";

/**
 * Reusable personalisation presets. Products opt in to these individually;
 * nothing is offered unless it is listed on the product record.
 */

export const giftMessage = (maxLength = 200): TextPersonalisation => ({
  id: "gift-message",
  kind: "text",
  label: "Gift message",
  helpText: "Handwritten on a card by the maker and tucked inside.",
  maxLength,
  extraCost: 0,
  multiline: true,
  required: false,
  placeholder: "Happy birthday! Thought of you the moment I saw this.",
});

export const recipientName = (
  extraCost: number,
  maxLength = 20,
  processingDaysAdded = 1,
): TextPersonalisation => ({
  id: "recipient-name",
  kind: "text",
  label: "Recipient name",
  helpText: "Printed on the label or tag.",
  maxLength,
  extraCost,
  required: false,
  processingDaysAdded,
  placeholder: "Ananya",
});

export const engraving = (
  label: string,
  extraCost: number,
  maxLength: number,
  processingDaysAdded: number,
): TextPersonalisation => ({
  id: "engraving",
  kind: "text",
  label,
  helpText: `Up to ${maxLength} characters. Letters, numbers and simple punctuation only.`,
  maxLength,
  extraCost,
  required: false,
  processingDaysAdded,
});

export const giftWrap = (extraCost = 150): ChoicePersonalisation => ({
  id: "packaging",
  kind: "choice",
  label: "Packaging",
  required: true,
  choices: [
    { id: "standard", label: "Standard box", extraCost: 0 },
    {
      id: "gift-wrap",
      label: "Textured paper wrap with burgundy ribbon",
      extraCost,
    },
  ],
});
