interface BaseStrategy {
    type: string;
}

interface None extends BaseStrategy {
    type: 'NONE';
}

type InitialisationStrategies = None;

export default InitialisationStrategies;
