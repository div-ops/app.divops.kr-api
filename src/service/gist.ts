export const GistService = {
  getContent: async (gistId: string) => {
    const response = await fetch(
      `https://app.divops.kr/github-api/api/gist/${gistId}/list`
    );

    const { data } = await response.json();
    return data;
  },
};
