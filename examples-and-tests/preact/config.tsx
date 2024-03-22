import { render } from "preact-render-to-string";
import { h } from "preact";

export const prerenderConfig = {
  render: async (Component: any, props: any) => {
    return render(<Component {...props} />);
  },
  postRender: (htmlString: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
};
