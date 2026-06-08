package com.project.aicrm.dto;

public class LeadAnalysisResult {
    private Integer score;
    private String urgency;
    private String summary;

    public LeadAnalysisResult() {}

    public LeadAnalysisResult(Integer score, String urgency, String summary) {
        this.score = score;
        this.urgency = urgency;
        this.summary = summary;
    }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}