import type { BranchTreeNode } from '@/lib/branchTree';

interface Props {
  root: BranchTreeNode;
  currentPieceId: string;
}

function NodeCard({ node, isCurrent }: { node: BranchTreeNode; isCurrent: boolean }) {
  const baseClasses =
    'inline-flex flex-col gap-0.5 rounded-xl border px-4 py-2.5 max-w-xs transition-colors';

  if (node.isPlaceholder) {
    return (
      <div className={`${baseClasses} border-dashed border-pale-slate-300 bg-pale-slate-100 text-pale-slate-400`}>
        <span className="text-sm font-medium italic truncate">{node.title}</span>
        <span className="text-xs">No longer available</span>
      </div>
    );
  }

  return (
    <a
      href={`/pieces/${node.id}`}
      className={`${baseClasses} ${
        isCurrent
          ? 'border-ruby-red-400 bg-ruby-red-50 ring-2 ring-ruby-red-200'
          : 'border-pale-slate-200 bg-white hover:border-air-force-blue-300 hover:shadow-sm'
      }`}
    >
      <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-ruby-red-700' : 'text-pale-slate-900'}`}>
        {node.title}
      </span>
      <span className="text-xs text-pale-slate-500 truncate">
        {node.authorName}
        {node.status === 'draft' && (
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-pale-slate-200 text-pale-slate-500 text-[10px] font-medium align-middle">
            Draft
          </span>
        )}
      </span>
    </a>
  );
}

function TreeBranch({
  node,
  currentPieceId,
  edgeLabel,
}: {
  node: BranchTreeNode;
  currentPieceId: string;
  edgeLabel?: string | null;
}) {
  const isCurrent = node.id === currentPieceId;

  return (
    <li>
      {edgeLabel && (
        <p className="text-xs text-pale-slate-400 mb-1.5">
          ⤷ forked from &ldquo;{edgeLabel}&rdquo;
        </p>
      )}
      <NodeCard node={node} isCurrent={isCurrent} />

      {node.children.length > 0 && (
        <ul className="mt-3 ml-5 pl-5 space-y-3 border-l border-pale-slate-200">
          {node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              currentPieceId={currentPieceId}
              edgeLabel={child.forkSectionTitle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BranchTree({ root, currentPieceId }: Props) {
  return (
    <div className="overflow-x-auto">
      <ul>
        <TreeBranch node={root} currentPieceId={currentPieceId} />
      </ul>
    </div>
  );
}
