export type StoreContact = Readonly<{ label: string; value: string; href?: string }>;

export type StoreSocial = Readonly<{ label: string; href: string }>;

export type StoreProfile = Readonly<{
  name: string;
  description: string;
  contacts: readonly StoreContact[];
  socials: readonly StoreSocial[];
}>;
