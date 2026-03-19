export interface SampleCase {
  input: string;
  output: string;
}

export interface ProblemData {
  id: string;
  title: string;
  samples: SampleCase[];
}

export interface ProblemService {
  fetch: (problemId: string) => Promise<ProblemData>;
}

function parseProblemId(problemId: string): { contestId: string; letter: string } {
  const match = /^(\d+)([A-Za-z]\d?)$/.exec(problemId);
  if (!match) throw new Error(`invalid problem id: ${problemId}`);
  return { contestId: match[1], letter: match[2] };
}

function parseTitle(html: string): string {
  const match = /<div\s+class="title">([^<]+)<\/div>/.exec(html);
  if (!match) throw new Error("could not parse problem title from page");
  return match[1].trim();
}

const HTML_ENTITY_MAP: { [entity: string]: string } = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeHtmlEntities(text: string): string {
  // First, replace common named entities we care about.
  const namedDecoded = text.replace(
    /&lt;|&gt;|&amp;|&quot;|&#39;|&nbsp;/g,
    (match) => (HTML_ENTITY_MAP[match] !== undefined ? HTML_ENTITY_MAP[match] : match)
  );
  // Then, handle generic numeric character references like &#39; or &#10;.
  return namedDecoded.replace(/&#(\d+);/g, (_, code: string) => {
    const num = Number(code);
    return Number.isFinite(num) ? String.fromCharCode(num) : _;
  });
}

function extractPreContents(html: string, role: "input" | "output"): string[] {
  const pattern = new RegExp(`<div class="${role}">[\\s\\S]*?<pre>([\\s\\S]*?)<\\/pre>`, "g");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const raw = decodeHtmlEntities(
      m[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
    );
    results.push(raw.trim() + "\n");
  }
  return results;
}

function parseSamples(html: string): SampleCase[] {
  const inputs = extractPreContents(html, "input");
  const outputs = extractPreContents(html, "output");
  return Array.from({ length: Math.min(inputs.length, outputs.length) }, (_, i) => ({
    input: inputs[i],
    output: outputs[i],
  }));
}

export function createProblemService(): ProblemService {
  return {
    fetch: async (problemId: string): Promise<ProblemData> => {
      const { contestId, letter } = parseProblemId(problemId);
      const response = await fetch(
        `https://codeforces.com/problemset/problem/${contestId}/${letter}`
      );
      if (!response.ok) {
        throw new Error(`codeforces returned ${response.status} for ${problemId}`);
      }
      const html = await response.text();
      return { id: problemId, title: parseTitle(html), samples: parseSamples(html) };
    },
  };
}
