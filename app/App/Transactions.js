Ext.define('PGP.Transactions',{
	extend: 'Ext.panel.Panel',	
	width:520	,	
	//height:180,	
	region:'west',
	//title:'ICSU Page',
	alias: 'widget.Trans',				
	//autoScroll:true,
	bodyPadding:10,	
	collapsible:true,
	initComponent:function(){	
	
		var layerStore= Ext.create('Ext.data.Store', {
			storeId:'lStore',
			fields:['Passcode', 'Agency','Date', 'Layers','Contact'],
			//model: 'tdModel',
			data:[{date:new Date(), agency:'NAMRIA',passcode:'12345', layers:'deped_beis', contact:'Melvin' },
				  {date:new Date(), agency:'NAMRIA',passcode:'67890', layers:'deped_beis', contact:'Melvin' } 
			]
		})	
		
		var layerStore2= Ext.create('Ext.data.Store', {
			storeId:'llistStore',
			fields:['Layer', 'Bounds'],
			//model: 'tdModel',
			data:[{Layer:'deped_beis', Bounds:' Bounds' },
				  {Layer:'deped_beis', Bounds:' Bounds' },
				  {Layer:'deped_beis', Bounds:' Bounds' },
				  
			]
		})
		
		
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
						store: Ext.data.StoreManager.lookup('lStore'),				
						columns:[
							{
								text:'Date',
								dataIndex:'date'	
							},
							{
								text:'Agency',
								dataIndex:'agency'	
							},
							{
								text:'Passcode',
								dataIndex:'passcode'
							},
							{
								text:'Layers',
								dataIndex:'layers'
							},
							{
								text:'Contact',
								dataIndex:'contact'
							}				
						]}
					]	
			  },
			  {
				xtype:'panel',				
				title:'Transaction Details',
				height:400,
				items:[
					    {
						   xtype:'textfield',
						   padding:'20 0 0 20',
						   itemId:'txtAgency',
						   width:450, 
						   fieldLabel:'Agency',
						   
					    },	
					    {
						   xtype:'textfield',
						   padding:'10 0, 0, 20',						   						   
						   itemId:'txtPcode',
						   width:450, 
						   fieldLabel:'Passcode'
					    }, 					  
					    {
						   xtype:'textfield',
						   padding:'10 0 0 20',
						   itemId:'txtContact',
						   width:450, 
						   fieldLabel:'Contact'
					    },
					    {
						   xtype:'grid',
						   width:472,
						   height:150,
						   padding:'10 0 0 20',
						   store: Ext.data.StoreManager.lookup('llistStore'),				
						   columns:[
							  {
							     text:'Layer name', 
								 dataIndex:'Layer',
								 width:250
							  },
							  {
								 text:'Bounds',
								 dataIndex:'Bounds',
								 width:200								
							  }	
						    ]
						
					    }
					  
					]
				
				}
			  
			  
			];				
	},
	buildButtons:function(){
		return[{
			xtype:'button',				
			itemId:'btnSave',
			text:'Save',		
			handler:function(){					
						
			}	
			
		}
		];
	
	}
	
});




