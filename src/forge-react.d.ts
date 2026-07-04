declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module '@forge/react' {
  export function Box(props: any): any;
  export function Button(props: any): any;
  export function Heading(props: any): any;
  export function Text(props: any): any;
  export function Table(props: any): any;
  export function Head(props: any): any;
  export function Row(props: any): any;
  export function Cell(props: any): any;
  export function Badge(props: any): any;
  export function ModalDialog(props: any): any;
  export function TextField(props: any): any;
  export function TextArea(props: any): any;
}

export {};
