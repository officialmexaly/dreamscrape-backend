import { ContactPage } from './_components';
import { getSiteContentSectionCached } from '@/src/lib/cached-site-content';

export default async function Page() {
  let initialCards:
    | Array<{ label: string; value: string; href: string }>
    | undefined;

  try {
    const { grouped } = await getSiteContentSectionCached('contact', 'contact_info');
    const data = grouped?.contact_contact_info || {};
    const cards = data.cards?.value || [];
    if (Array.isArray(cards) && cards.length) {
      initialCards = cards;
    }
  } catch {
    // ContactPage will use default cards
  }

  return <ContactPage initialCards={initialCards} />;
}
