
Ext.Loader.setConfig({
disableCaching: false,
enabled: true,
paths: {   
    PGP:'/app',
	GeoExt: "/lib/GeoExt",		
	Ext: '/lib/extjs/src',
	
	} 
});

Ext.application({
    name: 'OL3EXT4',	
	requires:[
		'PGP.MapPanel','PGP.Transactions', 'PGP.AvailableLayers'
	],
    launch: function () {
	
		var MapPanel= Ext.create('PGP.MapPanel');	 				
		var Trans= Ext.create('PGP.Transactions', { itemId: 'transactionPanel' });	 		
		var AvailableLayers= Ext.create('PGP.AvailableLayers');	 		
		
		
        Ext.create('Ext.container.Viewport', {	
            layout: 'border',						
            items:[			
				MapPanel,
				Trans,				
				AvailableLayers				
            ]
        });	
    }
});


