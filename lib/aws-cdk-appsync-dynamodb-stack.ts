import * as cdk from '@aws-cdk/core';
import * as appsync from "@aws-cdk/aws-appsync";
import * as ddb from "@aws-cdk/aws-dynamodb";
import { table } from 'console';
import { MappingTemplate } from '@aws-cdk/aws-appsync';


export class AwsCdkAppsyncDynamodbStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
  const api = new appsync.GraphqlApi(this,"My_api",{
name:"DynamoAndAppsync",
schema:appsync.Schema.fromAsset('graphql/schema.graphql'),
authorizationConfig:{
  defaultAuthorization:{
    authorizationType:appsync.AuthorizationType.API_KEY
  }
}
  })

  const table = new ddb.Table(this,"My_table",{
    partitionKey:{
      name:"id",
      type:ddb.AttributeType.STRING
    }
  })

  const dataSource = api.addDynamoDbDataSource('dataSource',table);

  dataSource.createResolver({
    typeName:"Mutation",
    fieldName:"addTodo",
    requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PartitionKey.partition('id').auto(),
    appsync.Values.projecting(),    
    ),
    responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
  })

  dataSource.createResolver({
    typeName:"Mutation",
    fieldName:"deleteTodo",
    requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id',"id")
    ,
    responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()})

  dataSource.createResolver({
    typeName:"Mutation",
    fieldName:"updateTodo",
    requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
    appsync.PartitionKey.partition('id').is('id'),
    appsync.Values.projecting()
    ),
    responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem() 
  } )

      
  dataSource.createResolver({
    typeName:"Query",
    fieldName:"getAllTodo",
    requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate:appsync.MappingTemplate.dynamoDbResultList()
  })

  dataSource.createResolver({
    typeName:"Query",
    fieldName:"getTodoById",
    requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('id','id'),
      responseMappingTemplate:appsync.MappingTemplate.dynamoDbResultItem()
  })
  
}
}
