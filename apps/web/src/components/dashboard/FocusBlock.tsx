 type FocusBlockProps = {
        description: string;
        onSuggest?: () => void;
    };

export default function FocusBlock({ description, onSuggest }: FocusBlockProps) {
   
    return (
       <section aria-labelledby="focusblock-title"
       className="rounded-xl border border-slate-200 bg-whit p-4 shadow-sm"
       >
       <h2 id="focusblock-title" className="text-sm font-semibold text-slate-800">
       AI Focus Block
       </h2>
       <div className="h-px bg-slate-100 my-3" />
       <p className="text-slate-500">
       {description}
       </p>
       <button onClick={onSuggest}
       className="mt-3 inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-indigo hover:bg-indigo-700">
        Suggest 60-min Block
        </button>
       </section>
    );
}