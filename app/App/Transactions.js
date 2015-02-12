Ext.define('PGP.Transactions',{
	extend: 'Ext.panel.Panel',
	width: 520	,
	region:'west',
	alias: 'widget.Trans',
	bodyPadding:10,	
	collapsible:true,
	initComponent:function(){	
	
		this.items = this.buildItems();
		this.buttons = this.buildButtons();
		this.callParent();	
	},	
	buildItems:function(){
		return[{		
				xtype:'panel',
				title:'Transactions',
				height:200,
				items:[
					{
						xtype: 'grid',
						width:502.1,
						height:260, 
						padding:'0 0 20 0',			
						columns:[
							{
								text:'Passcode',
								dataIndex:'passcode'
							},
							{
								text:'Contact',
								dataIndex:'contact_person',
								flex: 2
							},
							{
								xtype: 'datecolumn',
								text:'Expiration',
								dataIndex:'expiration_date',
								format: 'Y-m-d',
								align: 'center'
							},
							{
								text:'Agency',
								dataIndex:'agency'
							}				
						],
						store: Ext.create('Ext.data.Store', {
							model: 'Transaction',
							autoLoad: true,
							autoSync: true
						}),
						listeners: {
							select: function(grid, record){
							
								var form = this.up('Trans').down('form');
								form.loadRecord(record);
							
								var layers = record.get('layers');
								layers = (layers ? Ext.decode(layers) : []);
								
								var layerGrid = this.up('Trans').down('#layerGrid');
								layerGrid.getStore().loadData(layers);
							}
						}
					}
				]
			  },
			  {
				xtype:'form',				
				title:'Transaction Details',
				height:400,
				items:[
						{
						   xtype:'textfield',
						   padding:'10 0, 0, 20',
						   width:450, 
						   fieldLabel:'Passcode',
						   name: 'passcode',
						   readOnly: true
					    },
					    {
						   xtype:'textfield',
						   padding:'20 0 0 20',
						   width:450, 
						   fieldLabel:'Agency',
						   name: 'agency'
					    },	 					  
					    {
						   xtype:'textfield',
						   padding:'10 0 0 20',
						   width:450, 
						   fieldLabel:'Contact',
						   name: 'contact_person'
					    },
					    {
						   xtype:'grid',
						   itemId: 'layerGrid',
						   width:472,
						   height:150,
						   padding:'10 0 0 20',				
						   columns:[
							  {
							     text:'Layer name', 
								 dataIndex:'layer',
								 width:250
							  },
							  {
								 text:'Bounds',
								 dataIndex:'bounds',
								 width:200								
							  }	
						    ],
							store: Ext.create('Ext.data.Store', {
								model: 'Layer',
								data: []
							})
					    }
					  
					]
				
				}
			  
			  
			];				
	},
	buildButtons:function(){
		return[{
			xtype:'button',
			text:'Save',		
			handler:function(){					
				var form = this.up('Trans').down('form');
				var record = form.getRecord();
				form.updateRecord(record);
			}	
		}
		];
	},
	getSelectedRecord: function(){
		return this.down('form').getRecord();	
	},
	updateGrid: function(layers){
		var layerGrid = this.down('#layerGrid');
		layerGrid.getStore().loadData(layers);
	}
	
});


Ext.define('Transaction',{
	extend: 'Ext.data.Model',
	fields: [
		{
			name: 'passcode',
			type: 'string'
		},
		{
			name: 'date_requested',
			type: 'date'
		},
		{
			name: 'expiration_date',
			type: 'date'
		},
		{
			name: 'contact_person',
			type: 'string'
		},
		{
			name: 'agency',
			type: 'string'
		}
	],
	hasMany: 'Layer',
	idProperty: 'passcode',
	proxy: {
		type: 'rest',
		url: '/dl/transactions'
	}
});

Ext.define('Layer', {
	extend: 'Ext.data.Model',
	fields: [
		{
			name: 'layer',
			type: 'string'
		},
		{
			name: 'bounds',
			type: 'string'
		}
	]
});



