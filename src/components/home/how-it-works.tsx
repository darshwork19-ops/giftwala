const STEPS = [
  {
    title: "Describe the person",
    body: "Their interests, hobbies and personality, plus a budget if you have one. No need to know the product.",
  },
  {
    title: "Discover what fits",
    body: "Matching gifts from the GIFTWALA catalogue, each explained, and labelled ideas for things we don't stock.",
  },
  {
    title: "Check where and when",
    body: "Add a Mumbai area or PIN and a date to see which catalogue gifts can make it, based on maker lead times.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="bg-linen/60">
      <div className="page-container py-16 lg:py-20">
        <p className="eyebrow mb-3">How it works</p>
        <h2 id="how-title" className="font-serif text-3xl tracking-tight sm:text-4xl">
          From who they are to what to give
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-serif text-lg text-burgundy"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
