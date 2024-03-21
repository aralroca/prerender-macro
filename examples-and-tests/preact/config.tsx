import { render } from "preact-render-to-string";
import { h } from "preact";

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) => {
    return render(<Component {...props} />);
  },
  injectToJSX: (htmlString: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
};
