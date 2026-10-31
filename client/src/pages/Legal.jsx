import useSeo from '../hooks/useSeo.js';

const COPY = {
  privacy: { title: 'Privacy Policy', body: ['This is a starter privacy policy. Replace it with text reviewed for your business before launch.', 'When you send a message through the contact form, we store your name, email and message so we can reply. We do not run payment processing on this site.', 'Purchases are arranged over WhatsApp. Any details you share there are handled in that conversation.'] },
  terms: { title: 'Terms and Conditions', body: ['This is a starter set of terms. Replace it with text reviewed for your business before launch.', 'Books are digital products. Paid PDFs are released only after payment has been confirmed manually, using a personal access code.', 'Content remains the property of Dark Myth and may not be redistributed without permission.'] },
};

export default function Legal({ kind }) {
  const c = COPY[kind];
  useSeo({ title: `${c.title} | Dark Myth`, description: `${c.title} for Dark Myth, including information about our horror books, website, and customer enquiries.` });
  return (
    <div className="container-page max-w-3xl py-14 sm:py-20">
      <h1 className="heading-xl !text-5xl">{c.title}</h1>
      <div className="prose-dm mt-8">{c.body.map((p) => <p key={p}>{p}</p>)}</div>
    </div>
  );
}
