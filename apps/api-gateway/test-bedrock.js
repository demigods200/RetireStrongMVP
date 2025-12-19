import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const testBedrock = async () => {
  console.log('🧪 Testing Bedrock Models...\n');
  
  const modelsToTest = [
    'anthropic.claude-sonnet-4-20250514-v1:0',
    'anthropic.claude-3-5-sonnet-20241022-v2:0',
    'anthropic.claude-3-sonnet-20240229-v1:0',
    'us.anthropic.claude-sonnet-4-5-v1:0', // Inference profile format
  ];
  
  const regions = ['us-west-2', 'us-east-2'];
  
  for (const region of regions) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Testing Region: ${region}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    const client = new BedrockRuntimeClient({ region });
    
    for (const modelId of modelsToTest) {
      try {
        console.log(`Testing: ${modelId}`);
        
        const response = await client.send(new ConverseCommand({
          modelId,
          messages: [
            {
              role: 'user',
              content: [{ text: 'Say hello in 5 words' }]
            }
          ]
        }));
        
        console.log(`✅ SUCCESS!`);
        console.log(`   Response: ${response.output.message.content[0].text}\n`);
        
      } catch (err) {
        console.log(`❌ FAILED`);
        console.log(`   Error: ${err.name}`);
        console.log(`   Message: ${err.message}`);
        console.log(`   Code: ${err.$metadata?.httpStatusCode || 'N/A'}\n`);
      }
    }
  }
};

testBedrock().then(() => {
  console.log('\n✅ Test completed!');
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});

