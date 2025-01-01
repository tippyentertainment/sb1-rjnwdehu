import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { TimeEntry } from '@/types/timesheet';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  weekEnding: {
    fontSize: 14,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 24,
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    padding: 4,
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
  },
  projectCell: {
    flex: 2,
    padding: 4,
  },
  totalCell: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
  },
  typeCell: {
    flex: 1.5,
    padding: 4,
  },
});

interface TimesheetPDFProps {
  entries: TimeEntry[];
  selectedDate: Date;
}

const TimesheetPDF = ({ entries, selectedDate }: TimesheetPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Timesheet</Text>
          <Text style={styles.weekEnding}>
            Week Ending: {format(selectedDate, 'MMMM dd, yyyy')}
          </Text>
        </View>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.projectCell}>Project</Text>
            <Text style={styles.typeCell}>Type</Text>
            <Text style={styles.tableCell}>Mon</Text>
            <Text style={styles.tableCell}>Tue</Text>
            <Text style={styles.tableCell}>Wed</Text>
            <Text style={styles.tableCell}>Thu</Text>
            <Text style={styles.tableCell}>Fri</Text>
            <Text style={styles.tableCell}>Sat</Text>
            <Text style={styles.tableCell}>Sun</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          
          {entries.map((entry, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.projectCell}>{entry.project}</Text>
              <Text style={styles.typeCell}>{entry.type}</Text>
              {Object.values(entry.hours).map((hours, idx) => (
                <Text key={idx} style={styles.tableCell}>
                  {hours === '0' ? '' : hours}
                </Text>
              ))}
              <Text style={styles.totalCell}>{entry.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default TimesheetPDF;