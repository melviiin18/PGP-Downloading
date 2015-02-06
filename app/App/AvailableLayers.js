Ext.define('PGP.AvailableLayers', {
    extend: 'Ext.Panel',
	alias: 'widget.availablelayers',
    layout: 'fit',
	width:300, 	
	border: false,
	layout: 'border',
	title: 'Available layers',
	region: 'east',
	height: 100,
	split: true,
	title: 'Available Layers',
	items: [ 		 
			 {
				xtype: 'tabpanel',
				layout: 'fit',
				region: 'center',
				border: false,
				items: [
						{
							title: 'A-Z',
							id: 'tabAZ',
							layout: 'fit',
							border: false,
							items: [
								{ 
								   xtype: 'treepanel',
								   id: 'treeAZ',
								   rootVisible: false,			
								} 
							]
						},
						{
							title: 'by Agency',
							id: 'tabByAgency',
							layout: 'fit',
							border: false,
							items: [							
								{ 									
								   xtype: 'treepanel',
								   rootVisible: false,								   
								}								
							]
						},
						{
							title: 'by Category',
							id: 'tabBySector',
							layout: 'fit',
							border: false,
							items: [
							
								{ 
								   xtype: 'treepanel',
								   rootVisible: false,								   
								}
							
							
							]
						},					]
			    }	
			 
		     ],
	
    initComponent: function() {	
		this.callParent(arguments);
	}
});



