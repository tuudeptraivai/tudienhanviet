/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExampleWord {
  word: string;
  transcription: string;
  translation: string;
}

export interface DictionaryEntry {
  character: string;
  sinoVietnamese: string;
  pinyin: string;
  strokes: string;
  radical: string;
  definition: string;
  examples: ExampleWord[];
  analyticalNotes?: string;
}

export interface LookupResponse {
  source: string;
  results: DictionaryEntry[];
  suggestedQueries: string[];
  message?: string;
}
