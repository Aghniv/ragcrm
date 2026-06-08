package com.project.aicrm.service;

import com.project.aicrm.entity.Lead;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class GoogleSheetsService {

    @Value("${google.sheets.log.path:leads_log.csv}")
    private String logFilePath;

    public void logLead(Lead lead) {
        try {
            String header = "ID,Name,Email,Company,Status,Score,Created At";
            String row = String.format("%d,%s,%s,%s,%s,%s,%s",
                lead.getId(),
                escapeCsv(lead.getName()),
                escapeCsv(lead.getEmail()),
                escapeCsv(lead.getCompany()),
                lead.getStatus(),
                lead.getScore() != null ? lead.getScore().toString() : "",
                lead.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            );

            java.io.File file = new java.io.File(logFilePath);
            boolean isNew = !file.exists() || file.length() == 0;

            try (BufferedWriter writer = new BufferedWriter(new FileWriter(logFilePath, true))) {
                if (isNew) {
                    writer.write(header);
                    writer.newLine();
                }
                writer.write(row);
                writer.newLine();
            }

            System.out.println("Lead logged to file: " + lead.getName());
        } catch (IOException e) {
            System.err.println("Error logging lead: " + e.getMessage());
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}