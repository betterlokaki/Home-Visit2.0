export interface CoverStatusAndLinkRequest {
  [key: string]: {
    [innerKey: string]: string[] | { From: string; To: string };
  };
}

