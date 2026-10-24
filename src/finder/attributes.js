import chalk from 'chalk';

const severity = {
	HIGH : { value: 3, name: "HIGH" },
	MEDIUM : { value: 2, name: "MEDIUM" },
	LOW: { value: 1, name: "LOW" },
	INFORMATIONAL : { value: 0, name: "INFORMATIONAL", }
};

const confidence = {
	CERTAIN : { value: 2, name: "CERTAIN" },
	FIRM : { value: 1, name: "FIRM" },
	TENTATIVE: { value: 0, name: "TENTATIVE" }
};

const triage = {
	UNTRIAGED : { value: 0, name: "UNTRIAGED" },
	CONFIRMED : { value: 1, name: "CONFIRMED" },
	INVALID : { value: 2, name: "INVALID" }
};

function getSeverity(index) {
	switch(index) {
		case "0": return severity.INFORMATIONAL; break;
		case "1": return severity.LOW; break;
		case "2": return severity.MEDIUM; break;
		case "3": return severity.HIGH; break;
		default: return severity.INFORMATIONAL; break;
	}
}

module.exports.severity = severity;
module.exports.confidence = confidence;
module.exports.triage = triage;
module.exports.getSeverity = getSeverity;
