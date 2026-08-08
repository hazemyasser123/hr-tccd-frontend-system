import type { formPage, formPageError } from '@/shared/types/form';
import type { Question, questionError } from '@/shared/types/question';
import { ALLOWED_FIELDS } from "@/constants/formConstants";
import type { AllowedFields } from "@/constants/formConstants";

function sanitizeQuestion<T extends keyof AllowedFields>(
    obj: Record<string, any>,
    type: T
): Pick<typeof obj, AllowedFields[T][number]> {
    const allowed = new Set(ALLOWED_FIELDS[type]);
    const result: any = {};
    for (const key of Object.keys(obj)) {
        if (allowed.has(key as any)) {
        result[key] = obj[key];
        }
    }
    return result;
    }

function addQuestionError(errors: formPageError[], pIndex: number, qIndex: number, newError: Partial<Omit<questionError, "questionIndex">>) {
    const pageError = errors[pIndex] || {};
    const questions = [...(pageError.questions || [])];

    const existing = questions.find((q) => q.questionIndex === qIndex);
    if (existing) {
        Object.assign(existing, newError);
    } else {
        questions.push({ questionIndex: qIndex, ...newError });
    }

    errors[pIndex] = { ...pageError, questions };
}

// function checkPaths(pages: formPage[]) {
//   const n = pages.length;
//   const graph = new Map<number, number | null>();

//   // Normalize nextPage to internal 0-based indices.
//   // Accepts either 0-based or 1-based input (common mismatch).
//   function normalizeNext(raw: number | null | undefined, idx: number): number | null {
//     if (raw == null) return null;
//     if (!Number.isInteger(raw)) return null;
//     // If it's 1-based and within range [1..n], convert to 0-based
//     if (raw >= 1 && raw <= n) return raw - 1;
//     // If it's already 0-based and within [0..n-1], use as-is
//     if (raw >= 0 && raw < n) return raw;
//     // fallback: invalid reference
//     return NaN as any;
//   }

//   for (let i = 0; i < n; i++) {
//     const nextNorm = normalizeNext(pages[i].nextPage, i);
//     if (Number.isNaN(nextNorm)) {
//       return { valid: false, reason: `Page ${i + 1} has an invalid nextPage reference (${pages[i].nextPage}).` };
//     }
//     graph.set(i, nextNorm);
//   }

//   // Identify possible final nodes: next === null OR self-loop (next === id)
//   const endNodes = [...graph.entries()].filter(([id, next]) => next === null || next === id).map(([id]) => id);
//   if (endNodes.length !== 1) {
//     return { valid: false, reason: "This form doesn't have exactly one final Page (sink or self-loop)." };
//   }
//   const finalNode = endNodes[0];

//   // DFS cycle detection and ensure every node eventually leads to finalNode
//   const visiting = new Set<number>(); // nodes currently on recursion stack
//   const visited = new Set<number>();  // nodes fully processed
//   const leadsToEnd = new Map<number, boolean>();

//   function dfs(node: number): boolean {
//     // Short-circuit: if we've processed node completely, return cached result
//     if (visited.has(node)) return !!leadsToEnd.get(node);

//     // If we see node again on recursion stack => cycle (except allowed final self-loop handled below)
//     if (visiting.has(node)) {
//       // if this is the final node and it self-loops, that's okay — we'll catch earlier.
//       throw new Error("Cycle detected");
//     }

//     visiting.add(node);
//     const next = graph.get(node) as number | null;

//     let endsAtFinal = false;
//     if (next === null) {
//       endsAtFinal = node === finalNode;
//     } else if (next === node) {
//       // self-loop: OK only if this node is the final node
//       endsAtFinal = node === finalNode;
//       if (!endsAtFinal) {
//         // self-loop but not final -> it's a cycle
//         visiting.delete(node);
//         throw new Error("Cycle detected");
//       }
//     } else {
//       // recurse; if next points outside graph it'll be caught earlier by normalize
//       endsAtFinal = dfs(next);
//     }

//     visiting.delete(node);
//     visited.add(node);
//     leadsToEnd.set(node, endsAtFinal);
//     return endsAtFinal;
//   }

//   try {
//     for (let i = 0; i < n; i++) {
//       if (!dfs(i)) {
//         return { valid: false, reason: `Page ${i + 1} does not lead to final Page ${finalNode + 1}.` };
//       }
//     }
//   } catch (e: unknown) {
//     if (e instanceof Error && e.message === "Cycle detected") {
//       return { valid: false, reason: "This form has pages that loop (cycle) other than the allowed final self-loop." };
//     }
//     throw e;
//   }

//   // Optionally check for unreachable nodes (nodes not referenced by any path)
//   // But since we validated that every node leads to final via DFS above, this is implied.
//   return { valid: true, reason: "form transitions are valid", finalNode: finalNode + 1 };
// }


function reIndexFormPages(updatedPages: formPage[]) {
    let newQuestionCount = 0;
    const reindexedPages = updatedPages.map((page: formPage) => {
        const questions = (page.questions || []).map((q) => ({
            ...q,
            questionNumber: ++newQuestionCount,
        }));
        return { ...page, questions };
    });

    return { reindexedPages, newQuestionCount };
}

function reIndexPageQuestions(updatedPages: formPage[], pageIndex: number, questions: Question[]) {
    let newQuestionNumber = 1;
    const reindexedPages = updatedPages.map((page, idx) => {
    const qs = idx === pageIndex ? questions : (page.questions || []);
    return {
        ...page,
        questions: qs.map(q => ({ ...q, questionNumber: newQuestionNumber++ })),
    };
    });

    return { reindexedPages, newQuestionCount: newQuestionNumber };
}

export { addQuestionError, reIndexFormPages, reIndexPageQuestions, sanitizeQuestion };