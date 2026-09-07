export type PublicContactChannelInput = {
  id: string;
  channelType: string;
  label: string;
  value: string;
  href?: string;
};

export type PublicContactAction = {
  id: string;
  label: string;
  href: string;
  kind: string;
  isExternal: boolean;
};

export function createPublicContactActions(
  channels: PublicContactChannelInput[] = [],
): PublicContactAction[] {
  return channels.flatMap((channel) => createChannelActions(channel));
}

export function getExternalLinkProps(action: PublicContactAction) {
  return action.isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function createChannelActions(
  channel: PublicContactChannelInput,
): PublicContactAction[] {
  const value = channel.value.trim();

  if (!value) {
    return [];
  }

  if (channel.channelType === "phone") {
    return splitPhoneNumbers(value).flatMap((phone, index) => {
      const href = createTelHref(phone);

      return href
        ? [
            {
              id: `${channel.id}-phone-${index}`,
              label: `Call ${phone}`,
              href,
              kind: "phone",
              isExternal: false,
            },
          ]
        : [];
    });
  }

  const href = createActionHref(channel);

  if (!href) {
    return [];
  }

  return [
    {
      id: channel.id,
      label: createActionLabel(channel),
      href,
      kind: channel.channelType,
      isExternal: isExternalHref(href),
    },
  ];
}

// Exported alongside createTelHref: a stored phone value can hold more than
// one number (Hallelujah's is "9975 / 0965407886"), and anything building a
// tel: link has to split first or it dials the two concatenated together.
export function splitPhoneNumbers(value: string): string[] {
  return value
    .split(/[\/,;\n\r|]+/)
    .map((phone) => phone.trim())
    .filter(Boolean);
}

// Exported so the facility page's appointment rows dial the same way the Call
// button does, rather than growing a fourth copy of "strip everything that is
// not a digit or a plus".
export function createTelHref(value: string): string | undefined {
  const telValue = value.replace(/[^\d+]/g, "");

  return telValue ? `tel:${telValue}` : undefined;
}

function createActionHref(
  channel: PublicContactChannelInput,
): string | undefined {
  if (channel.href) {
    return channel.href;
  }

  const value = channel.value.trim();

  if (channel.channelType === "email" && value.includes("@")) {
    return `mailto:${value}`;
  }

  if (channel.channelType === "whatsapp") {
    const phone = value.replace(/[^\d]/g, "");
    return phone ? `https://wa.me/${phone}` : createWebHref(value);
  }

  if (channel.label.toLowerCase() === "telegram") {
    if (value.startsWith("@")) {
      return `https://t.me/${value.slice(1)}`;
    }

    return createWebHref(value);
  }

  return createWebHref(value);
}

function createActionLabel(channel: PublicContactChannelInput): string {
  if (channel.channelType === "email") {
    return "Send email";
  }

  if (channel.channelType === "website") {
    return "Open website";
  }

  if (channel.channelType === "maps") {
    return "Open Google Maps";
  }

  if (channel.channelType === "whatsapp") {
    return "Open WhatsApp";
  }

  if (channel.label.toLowerCase() === "telegram") {
    return "Open Telegram";
  }

  if (channel.channelType === "appointment") {
    return "Open booking";
  }

  return `Open ${channel.label}`;
}

function createWebHref(value: string): string | undefined {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}/i.test(value)) {
    return `https://${value}`;
  }

  return undefined;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
