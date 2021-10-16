export class jsonModel {
    DiagramType: string;
    Shapes: shape[];
}

export class shape {
    Name: string;
    Type: string;
    Step: number;
    Edges: {
        Destination: number;
        Text: string;
    }[];
    x?: number;
    y?: number;
    StepVariable?: any;
}