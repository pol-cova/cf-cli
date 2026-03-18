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

export function createProblemService(): ProblemService {
  return {
    fetch: async (problemId: string): Promise<ProblemData> => {
      // Placeholder fetcher for initial implementation.
      // Next iteration: replace with real Codeforces HTML retrieval/parsing.
      return {
        id: problemId,
        title: "Sample Problem (stub)",
        samples: [
          {
            input: "1\n",
            output: "1\n",
          },
        ],
      };
    },
  };
}
