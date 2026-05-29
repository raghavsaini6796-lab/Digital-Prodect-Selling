import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666666',
  },
  // Add more styles as needed
});

export const generatePDF = async (product: any) => {
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{product.title || 'Untitled Product'}</Text>
          <Text style={styles.subtitle}>{product.subtitle || 'No subtitle provided'}</Text>
        </View>
        
        {/* Hook Section */}
        <View style={styles.section}>
          <Text style={{fontWeight: 'bold', marginBottom: 10}}>
            Viral Hook:
          </Text>
          <Text>{product.hook}</Text>
        </View>

        {/* Actionable Sections */}
        {product.sections?.map((section: string, index: number) => (
          <View key={index} style={styles.section}>
            <Text style={{marginBottom: 10}}>{section}</Text>
          </View>
        ))}
        
        {/* CTA Section */}
        <View style={styles.section}>
          <Text style={{fontWeight: 'bold', marginBottom: 10}}>Call to Action:</Text>
          <Text>{product.cta}</Text>
        </View>
      </Page>
    </Document>
  );

  return MyDocument;
};

export const savePDF = async (pdfDocument: any) => {
  const { saveAs } = await import('file-saver');
  const { pdf } = await import('@react-pdf/renderer');
  
  const blob = await pdf(pdfDocument()).toBlob();
  saveAs(blob, `viral-product-${Date.now()}.pdf`);
};
