export interface Failure<FailureType extends number> {
    type: FailureType;
    reason: string;
}